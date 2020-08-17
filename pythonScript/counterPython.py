# from collections import Counter
# import sys
# import json
# result = {
#     'array': sys.argv[1],
#   }
#
# my_bonsai_trees = result['array']
# count = Counter(my_bonsai_trees)
# print(count)
#
# json = json.dumps(count)
#
# print(str(json))
# sys.stdout.flush()
#
#
# #

# from collections import Counter
# import sys
# import json
#
# result = {
#     'array': sys.argv[1],
#   }
# my_bonsai_trees = result['array']
# #my_bonsai_trees = ['maple', 'oak', 'elm', 'maple', 'elm', 'elm', 'elm', 'elm']
# count = Counter(my_bonsai_trees)
# print(count)
#
# json = json.dumps(count)
#
# print(str(json))
# sys.stdout.flush()


from collections import Counter
import sys
import json


my_name = sys.argv[1:]
count = Counter(my_name)

# items = Counter(str(item) for item in my_name)


print(count)

sys.stdout.flush()



